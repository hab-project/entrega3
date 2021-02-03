require('dotenv').config()

/* const bcrypt = require('bcrypt'); */

const { getConnection } = require("./db");

async function main() {
  let connection;

  try {
    connection = await getConnection();

    await connection.query("DROP TABLE IF EXISTS messages");
    await connection.query("DROP TABLE IF EXISTS transactions");
    await connection.query("DROP TABLE IF EXISTS images");
    await connection.query("DROP TABLE IF EXISTS books");
    await connection.query("DROP TABLE IF EXISTS users");
        

    // también podéis tener el archivo .sql e inicializar
    // la BBDD desde la terminal o aplicación de escritorio
    await connection.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        photo varchar(200),
        name varchar(50) not null,
        surnames varchar(70) not null,
        address varchar(250) not null,
        location varchar(50) not null,
        phone varchar(9) not null,
        email varchar(50) not null unique,
        password varchar(100) not null,
        active boolean default false,
        validationCode VARCHAR(100),
        expirationCodeDate timestamp,
        petition_book_1 varchar(30),
        petition_book_2 varchar(30),
        petition_book_3 varchar(30),
        creation_date timestamp not null default current_timestamp,
        update_date timestamp not null default current_timestamp on update current_timestamp
      )
    `);

    await connection.query(`
      CREATE TABLE books (
        id integer auto_increment primary key,
        id_user integer not null,
        isbn varchar(30) not null,
        title varchar(50) not null,
        course enum('1º Infantil', '2º Infantil', '1º Primaria', '2º Primaria', '3º Primaria', '4º Primaria',
		      '1º E.S.O.', '2º E.S.O.', '3º E.S.O.', '4º E.S.O.', '1º Bachiller', '2º Bachiller') not null,
	      editorial varchar(20),
        editionYear integer,
        price float not null,
        available boolean default false,
        activationCode varchar(100),
        detail varchar(200),
        creation_date timestamp not null default current_timestamp,
        update_date timestamp not null default current_timestamp on update current_timestamp,
        constraint book_iduser_fk1 foreign key (id_user)
		      references users(id) on delete no action
      )
    `);

    await connection.query(`
      CREATE TABLE images (
        id integer auto_increment primary key,
        uuid varchar(100) not null,
        id_book integer not null,
        visible boolean default true,
        constraint images_idbook_fk1 foreign key (id_book)
		      references books(id) on delete no action
      )
    `);

    await connection.query(`
      CREATE TABLE transactions (
        id integer auto_increment primary key,
        id_book integer not null,
        id_buyer integer not null,
        review enum('Mal', 'Regular', 'Bien', 'Muy bien'),
        status enum('completado', 'en proceso', 'cancelado') default 'en proceso',
        transfer_place varchar(50),
        transfer_date  timestamp,
        creation_date timestamp not null default current_timestamp,
        update_date timestamp not null default current_timestamp on update current_timestamp,
        constraint transactions_idbook_fk1 foreign key (id_book)
		      references books(id) on delete no action,
	      constraint transactions_idbuyer_fk2 foreign key (id_buyer)
		      references users(id) on delete no action
	    )
    `);

    await connection.query(`
      CREATE TABLE messages (
        id integer auto_increment primary key,
        id_chat varchar(30) not null,
        id_book integer not null,
        id_seller integer not null,
        id_buyer integer not null,
        id_destination integer not null,
        content varchar(120) not null,
        viewed boolean default false,
        visibleForSeller boolean default true,
        visibleForBuyer boolean default true,
        creation_date timestamp not null default current_timestamp,
        update_date timestamp not null default current_timestamp on update current_timestamp,
        constraint messages_idbook_fk2 foreign key (id_book)
		      references books(id) on delete no action
      )
    `);

    /* const passwordBcrypt = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);

    await connection.query(
      `insert into users (email, password, role, active) values (?,?, 'admin', true)`,
      ['admin@midominio.com', passwordBcrypt]
    ) */

  } catch (e) {
    console.log('Some error ocurred: ', e)
  } finally {
    // si llegamos hasta aquí es que no hubo ningún error,
    // así que liberamos la conexión (de no hacerlo dejaríamos un 
    // recurso ocupado)
    if (connection) {
      connection.release();
    }

    // Salimos del proceso explícitamente. Podéis probar a 
    // eliminar esta línea y comprobad que la aplicación
    // no retorna el control a la terminal
    process.exit();
  }
}

(async () => {
  await main()
})()
