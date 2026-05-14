process.env.NTBA_FIX_350 = 1;
const TelegramBot = require('node-telegram-bot-api');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv').config();

// Ton Token ici
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Le bot est démarré et prêt à télécharger...');

// On ajoute "async" ici car on va faire des actions qui prennent du temps (téléchargement)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const texte = msg.text;

    // Vérification basique si c'est un lien Twitter/X
    if (texte && (texte.includes('twitter.com') || texte.includes('x.com'))) {

        // 1. On prévient que le job commence
        const waitMsg = await bot.sendMessage(chatId, "⏳ Lien détecté ! Téléchargement de la vidéo en cours...");

        // On génère un nom de fichier unique basé sur l'heure actuelle
        const fileName = `video_${Date.now()}.mp4`;
        const filePath = path.join(__dirname, fileName);

        try {
            // 2. On lance le téléchargement (Méthode Fichier)
            await youtubedl(texte, {
                output: filePath,
                format: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
                cookies: './cookies.txt', // Pointeur vers ton fichier de cookies
            });

            // Vérification de la taille du fichier (Limite Telegram = 50 Mo)
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB >= 49.5) {
                await bot.editMessageText(`✂️ Vidéo de ${fileSizeInMB.toFixed(1)} Mo détectée. Découpage en plusieurs parties de 45 Mo en cours...`, {
                    chat_id: chatId,
                    message_id: waitMsg.message_id
                });
                
                try {
                    // Obtenir la durée totale pour calculer le découpage
                    const durationStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf-8' }).trim();
                    const totalDuration = parseFloat(durationStr);
                    
                    // Calculer le nombre de parties et la durée d'une partie
                    const numberOfChunks = Math.ceil(fileSizeInMB / 45); // Environ 45 Mo par partie
                    const segmentTime = Math.ceil(totalDuration / numberOfChunks);
                    
                    const baseName = fileName.replace('.mp4', '');
                    const splitPattern = path.join(__dirname, `${baseName}_part%03d.mp4`);
                    
                    // Découper la vidéo avec FFmpeg
                    execSync(`ffmpeg -i "${filePath}" -c copy -map 0 -segment_time ${segmentTime} -f segment -reset_timestamps 1 "${splitPattern}"`);
                    
                    // Récupérer la liste des fichiers créés (triés par ordre alphabétique)
                    const files = fs.readdirSync(__dirname).filter(f => f.startsWith(baseName + '_part') && f.endsWith('.mp4')).sort();
                    
                    await bot.editMessageText(`🚀 Découpage terminé ! Envoi des ${files.length} morceaux vers Telegram...`, {
                        chat_id: chatId,
                        message_id: waitMsg.message_id
                    });
                    
                    // Envoyer les morceaux un par un
                    for (let i = 0; i < files.length; i++) {
                        const partPath = path.join(__dirname, files[i]);
                        await bot.sendVideo(chatId, partPath, { caption: `Partie ${i + 1}/${files.length}` });
                        fs.unlinkSync(partPath); // Nettoyer le morceau
                    }
                    
                    // Nettoyage final
                    await bot.deleteMessage(chatId, waitMsg.message_id);
                    fs.unlinkSync(filePath); // Nettoyer l'original
                    return; // Fin du processus pour cette vidéo
                    
                } catch (splitError) {
                    console.error("Erreur de découpage avec FFmpeg :", splitError);
                    bot.sendMessage(chatId, "❌ Une erreur s'est produite lors du découpage de la vidéo.");
                    fs.unlinkSync(filePath);
                    return;
                }
            }

            // 3. On met à jour le message pour dire qu'on envoie la vidéo
            await bot.editMessageText("🚀 Téléchargement terminé ! Envoi vers Telegram en cours...", {
                chat_id: chatId,
                message_id: waitMsg.message_id
            });

            // 4. On envoie le fichier vidéo sur Telegram
            await bot.sendVideo(chatId, filePath);

            // On fait le ménage : on supprime le message d'attente qui ne sert plus à rien
            await bot.deleteMessage(chatId, waitMsg.message_id);

            // 5. 🧹 On supprime le fichier de ton PC pour ne pas prendre de place inutilement
            fs.unlinkSync(filePath);

        } catch (error) {
            if (error.stderr && error.stderr.includes('No video could be found in this tweet')) {
                console.error("Aucune vidéo trouvée dans le tweet.");
                bot.sendMessage(chatId, "❌ Il n'y a pas de vidéo dans ce tweet !");
            } else {
                console.error("Erreur de téléchargement :", error.message);
                bot.sendMessage(chatId, "❌ Oups, une erreur est survenue lors du téléchargement. Le tweet est peut-être privé ou supprimé.");
            }

            // Si le script a planté en plein milieu, on vérifie si un fichier a été créé et on le supprime
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } else {
        bot.sendMessage(chatId, "Envoie-moi un lien Twitter (ou X) pour que je récupère la vidéo !");
    }
});