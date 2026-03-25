async function createOrUpdateTemplate() {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.error('Error: BREVO_API_KEY is not set in the environment variables.');
        return;
    }

    const templateData = {
        name: 'Welcome Email',
        subject: 'Welcome to Our Service!',
        htmlContent: '<html><body><h1>Welcome!</h1><p>We are glad to have you with us.</p></body></html>',
    };

    try {
        const response = await fetch('https://api.brevo.com/v1/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify(templateData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Template created/updated successfully:', data);
        } else {
            const data = await response.json();
            console.log('Failed to create/update template:', data);
        }
    } catch (error: unknown) {
        console.error('Error while making request to Brevo API:', (error as Error).message);
    }
}

createOrUpdateTemplate();
