const nodemailer = require('nodemailer');

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // App password (not regular password)
    }
  });
};

// Send reminder email
const sendReminderEmail = async (userEmail, userName, reminderMessage) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `DayTrack <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '📝 Daily Diary Reminder - DayTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📝 DayTrack</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              ${reminderMessage}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Write Now
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              This is an automated reminder from DayTrack. You can manage your notification preferences in Settings.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send weekly analysis email
const sendWeeklyAnalysisEmail = async (userEmail, userName, analysis) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `DayTrack <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '📊 Your Weekly Analysis - DayTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📊 Weekly Analysis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Here's your weekly reflection summary:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${analysis}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Keep up the great work! 🌟
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Weekly analysis email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending weekly analysis email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendReminderEmail,
  sendWeeklyAnalysisEmail
};
