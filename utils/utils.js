const sendgrid = require("@sendgrid/mail");

const sendConfirmationMail = async (email, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'Validate your account',
      text: `La dirección de verificación es: ${link}`,
      html: `
        <div>
          <h1> Valida tu registro </h1>
          <p> Si te has registrado en el sistema, accede al siguiente
          enlace para validar tu cuenta. El enlace es válido durante 2 horas: </p>

          ${link}
        </div>
      `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendVerificationMail = async (email, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'Your account has been activated',
      text: `Su cuenta ha sido activada correctamente`,
      html: `
      <div>
        <h1> Cuenta activada </h1>
        <p> Su registro se ha completado correctamente y
        ya puede acceder a su cuenta: </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendRecoverPasswordMail = async (email, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'Reset your password',
      text: `Recupera tu contraseña`,
      html: `
      <div>
        <h1> Resetear la contraseña </h1>
        <p> Si has olvidado tu contraseña accede al siguiente
        enlace para recuperarla. El enlace es válido durante 2 horas:  </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendBookingMail = async (sellerMail, buyerMail, title, curso, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const sellerMessage = {
      to: sellerMail,
      from: 'patarrata@gmail.com',
      subject: 'New petition of your books',
      text: `Has recibido una solicitud de tu libro: ${title}, ${curso}`,
      html: `
      <div>
        <h1> Confirma la venta de tu libro </h1>
        <p> Accede a tu cuenta para concertar la entrega 
        y confirmar la venta </p>

        ${link}
      </div>
    `,
  };

  const buyerMessage = {
      to: buyerMail,
      from: 'patarrata@gmail.com',
      subject: 'You have created a new petition',
      text: `Has solicitado la compra del libro: ${title}, ${curso}`,
      html: `
      <div>
        <h1> Comprueba el estado de tu solicitud </h1>
        <p> Accede a tu cuenta y envíale un mensaje
        al vendedor para concertar la entrega </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensajes
  await sendgrid.send(sellerMessage);
  await sendgrid.send(buyerMessage);

}

const sendCompletedTransactionMail = async (sellerMail, buyerMail, title, curso, place, date, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const sellerMessage = {
      to: sellerMail,
      from: 'patarrata@gmail.com',
      subject: 'Transaction completed',
      text: `Has completado la transacción de tu libro: ${title}, ${curso}`,
      html: `
      <div>
        <h1> Transacción completada </h1>
        <p> La entrega será en ${place} en la fecha ${date}.
        Accede a tu cuenta para comprobar el estado de tus libros </p>

        ${link}
      </div>
    `,
  };

  const buyerMessage = {
      to: buyerMail,
      from: 'patarrata@gmail.com',
      subject: 'Transaction completed',
      text: `¡Enhorabuena! Has comprado el libro: ${title}, ${curso}`,
      html: `
      <div>
        <h1> Compra finalizada </h1>
        <p> La entrega será en ${place} en la fecha ${date}. Después de la entrega
        accede a tu cuenta y envíale una valoración al vendedor </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensajes
  await sendgrid.send(sellerMessage);
  await sendgrid.send(buyerMessage);

}

const sendCanceledTransactionMail = async (sellerMail, buyerMail, idTransaction, title, curso, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const sellerMessage = {
      to: sellerMail,
      from: 'patarrata@gmail.com',
      subject: 'Transaction canceled',
      text: `Se ha cancelado la transacción ${idTransaction} de tu libro: ${title}, ${curso}`,
      html: `
      <div>
        <h1> Transacción ${idTransaction} cancelada </h1>
        <p> Accede a tu cuenta para comprobar el estado
        de tus libros </p>

        ${link}
      </div>
    `,
  };

  const buyerMessage = {
      to: buyerMail,
      from: 'patarrata@gmail.com',
      subject: 'Transaction canceled',
      text: `Se ha cancelado la transacción ${idTransaction} del libro: ${title}, ${curso}`,
      html: `
      <div>
        <h1> Transacción ${idTransaction} cancelada </h1>
        <p> El vendedor ha retirado el libro o 
        éste ha sido vendido. Accede a tu cuenta y comprueba
        el estado de tus compras </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensajes
  await sendgrid.send(sellerMessage);
  await sendgrid.send(buyerMessage);
}

const sendRecoveredPasswordMail = async (email, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'Password changed',
      text: `Has recuperado tu contraseña`,
      html: `
      <div>
        <h1> Contraseña recuperada </h1>
        <p> Has recuperado tu contraseña. Ya 
        puedes acceder a tu cuenta:  </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendMessageReceivedMail = async (email, title, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'You have received a new message',
      text: `Has recibido un nuevo mensaje acerca del libro: ${title}`,
      html: `
      <div>
        <h1> Nuevo mensaje recibido </h1>
        <p> Has recibido un nuevo mensaje. Accede
        a tu cuenta para responder: </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendPetitionRequiredMail = async (email, isbn, title, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'Your ISBN petition is already available',
      text: `Ya está disponible el libro: ${title}`,
      html: `
      <div>
        <h1> Libro solicitado ya disponible </h1>
        <p> Ya está disponible el libro con ISBN: ${isbn}.
         Accede a tu cuenta y realiza tu compra: </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendReqAuthorizationMail = async (isbn, title, course, editorial, editionYear, price, detail, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);
  console.log(process.env.ADMIN_EMAIL)
  const message = {
      to: `${process.env.ADMIN_EMAIL}`,
      from: 'patarrata@gmail.com',
      subject: 'New book in the platform, check and validate',
      text: `Se ha subido un nuevo libro: ${title}`,
      html: `
      <div>
        <h1> Nuevo libro subido, datos: </h1>
        <p>Título: ${title}</p>
        <p>ISBN: ${isbn}</p>
        <p>Curso: ${course}</p>
        <p>Editorial: ${editorial}</p>
        <p>Año de edición: ${editionYear}</p>
        <p>Precio: ${price}</p>
        <p>Detalle: ${detail}</p>
        <p> Para confirmar su activación pincha en el 
        siguiente enlace y se activará automáticamente: </p>

        ${link}
      </div>
    `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

const sendConfirmationUploadedMail = async (email, isbn, title, link) => {
  sendgrid.setApiKey(process.env.EMAIL_API_KEY);

  const message = {
      to: email,
      from: 'patarrata@gmail.com',
      subject: 'Your book has been activated!',
      text: `El libro con título ${title} y ISBN ${isbn} ha sido activado`,
      html: `
        <div>
          <h1> Accede a tu cuenta</h1>
          <p> Accede ya a tu cuenta y revisa el estado
          de tus libros: </p>

          ${link}
        </div>
      `,
  };

  // Enviar mensaje
  await sendgrid.send(message);
}

module.exports = {
  sendBookingMail,
  sendCanceledTransactionMail,
  sendCompletedTransactionMail,
  sendConfirmationMail,
  sendConfirmationUploadedMail,
  sendMessageReceivedMail,
  sendPetitionRequiredMail,
  sendRecoverPasswordMail,
  sendRecoveredPasswordMail,
  sendReqAuthorizationMail,
  sendVerificationMail
}