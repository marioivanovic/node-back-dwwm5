import cloudinary from '../config/cloudinary.js';
import fs from 'fs';


/**
 * Télécharge notre image vers Cloudinary
 * @param {string} filePath - Chemin du fichier local
 * @param {string} folder - Dossier de destination sur Cloudinary
 * @returns {Promise} Résultat de l'upload
 */
export const uploadImage = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image'
    });
    
    // Supprimer le fichier local après l'upload
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    // Supprimer le fichier local en cas d'erreur
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Télécharge plusieurs images vers Cloudinary
 * @param {Array} files - Tableau d'objets de fichiers de Multer
 * @param {string} folder - Dossier de destination sur Cloudinary
 * @returns {Promise<Array>} Tableau de résultats d'upload
 */
export const uploadMultipleImages = async (files, folder) => {
  const uploadPromises = files.map(file => uploadImage(file.path, folder));
  return Promise.all(uploadPromises);
};