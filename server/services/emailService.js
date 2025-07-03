const nodemailer = require('nodemailer');

// Configuration du transporteur email (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // À configurer
    pass: process.env.EMAIL_PASS || 'your-app-password' // Mot de passe d'application Gmail
  }
});

// Fonction pour envoyer une notification de nouveau ticket à l'admin
const sendNewTicketNotification = async (ticketData) => {
  const { title, description, priority, service, service_demandeur, nom_demandeur, estimated_time } = ticketData;
  
  const estimatedTimeText = estimated_time ? `${estimated_time} heures` : 'Non estimé';
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'ladislas.c@sedi-ati.com',
    subject: `Nouveau ticket créé - ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          Nouveau ticket créé
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">${title}</h3>
          
          <div style="margin: 15px 0;">
            <strong>Description:</strong><br>
            <p style="background-color: white; padding: 10px; border-radius: 4px; margin: 5px 0;">
              ${description}
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div>
              <strong>Priorité:</strong><br>
              <span style="color: ${priority === 'haute' ? '#e74c3c' : priority === 'normale' ? '#f39c12' : '#27ae60'}; font-weight: bold;">
                ${priority.toUpperCase()}
              </span>
            </div>
            
            <div>
              <strong>Service:</strong><br>
              <span>${service}</span>
            </div>
            
            <div>
              <strong>Service demandeur:</strong><br>
              <span>${service_demandeur}</span>
            </div>
            
            <div>
              <strong>Nom demandeur:</strong><br>
              <span>${nom_demandeur}</span>
            </div>
            
            <div>
              <strong>Temps estimé:</strong><br>
              <span>${estimatedTimeText}</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px;">
          <p>Ce message a été envoyé automatiquement par le système de gestion de tickets.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de notification envoyé à l\'admin:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonction pour envoyer une notification de mise à jour de statut
const sendStatusUpdateNotification = async (ticketData, newStatus) => {
  const { title, description, priority, service, service_demandeur, nom_demandeur } = ticketData;
  
  const statusColors = {
    'nouveau': '#3498db',
    'en_cours': '#f39c12',
    'termine': '#27ae60',
    'annule': '#e74c3c'
  };
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'ladislas.c@sedi-ati.com',
    subject: `Mise à jour du ticket - ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          Mise à jour du ticket
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">${title}</h3>
          
          <div style="margin: 15px 0;">
            <strong>Nouveau statut:</strong><br>
            <span style="color: ${statusColors[newStatus]}; font-weight: bold; font-size: 16px;">
              ${newStatus.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Description:</strong><br>
            <p style="background-color: white; padding: 10px; border-radius: 4px; margin: 5px 0;">
              ${description}
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div>
              <strong>Priorité:</strong><br>
              <span style="color: ${priority === 'haute' ? '#e74c3c' : priority === 'normale' ? '#f39c12' : '#27ae60'}; font-weight: bold;">
                ${priority.toUpperCase()}
              </span>
            </div>
            
            <div>
              <strong>Service:</strong><br>
              <span>${service}</span>
            </div>
            
            <div>
              <strong>Service demandeur:</strong><br>
              <span>${service_demandeur}</span>
            </div>
            
            <div>
              <strong>Nom demandeur:</strong><br>
              <span>${nom_demandeur}</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px;">
          <p>Ce message a été envoyé automatiquement par le système de gestion de tickets.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de mise à jour envoyé à l\'admin:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

module.exports = {
  sendNewTicketNotification,
  sendStatusUpdateNotification
}; 