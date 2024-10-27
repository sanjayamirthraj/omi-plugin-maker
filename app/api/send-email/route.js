import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const pluginData = JSON.parse(formData.get('pluginData'));
        const file = formData.get('file');

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
            <p>Please find the plugin logo attached.</p>
            <p>Thank you!</p>
          `;

        let attachments = [];
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            attachments.push({
                filename: file.name,
                content: buffer,
            });
        }

        // Set up email data
        const mailOptions = {
            from: '"Plugin Team" <sanjay.amirthraj@gmail.com>', // Sender address
            to: 'sanjay.amirthraj@gmail.com', // List of recipients
            subject: 'New Plugin Submission', // Subject line
            html: emailTemplate, // HTML body content
            attachments,
        };

        // Send mail
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email.' },
            { status: 500 }
        );
    }
}
