import nodemailer from 'nodemailer';

export async function POST(req) {
    const { pluginData } = await req.json();

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_APP_PASSWORD, // Your Gmail app password
        },
    });


    const emailTemplate = `
        <h1>New Plugin Submission</h1>
        <p>A new plugin has been submitted:</p>
        <h2>Plugin Details</h2>
        <pre>${JSON.stringify(pluginData, null, 2)}</pre>
        <p>Thank you!</p>
      `;

    // Set up email data
    const mailOptions = {
        from: '"Plugin Team" <sanjay.amirthraj@gmail.com>', // Sender address
        to: 'sanjay.amirthraj@gmail.com', // List of recipients
        subject: 'New Plugin Submission', // Subject line
        html: emailTemplate, // HTML body content
    };

    // Send mail
    try {
        await transporter.sendMail(mailOptions);
        return new Response(JSON.stringify({ message: 'Email sent successfully!' }), { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: 'Failed to send email.' }), { status: 500 });
    }
}

