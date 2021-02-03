const { getConnection } = require("./db");

async function search(req, res, next) {
    let connection;
    
    try {
        connection = await getConnection();

        const { isbn, title, course, price1, price2, order, direction } = req.query
        
        //Query base:
        let query = "SELECT * FROM books";

        //Establecer criterio de sentido de búsqueda
        const orderDirection = (direction && direction.toLowerCase()) === "asc" ? "ASC" : "DESC";

        //Establecer criterio de orden de búsqueda
        let orderBy;
        switch (order) {
            case "precio":
                orderBy = "precio";
                break;
            case "creationDate":
                orderBy = "creation_date";
                break;
            default:
                orderBy = "creation_date"
        }

        //Parámetros de búsqueda:
        const params = [];

        //Construimos Query multibúsqueda:
        if (isbn || title || course || (price1 && price2)) {

            //Establecemos condiciones para la query
            const conditions = [];
            if (isbn) {
                conditions.push(`isbn=?`)
                params.push(`${isbn}`)
            }
            if (title) {
                conditions.push(`title=?`)
                params.push(`${title}`)
            }
            if (course) {
                conditions.push(`course=?`)
                params.push(`${course}`)
            }
            if (price1 && price2) {
                conditions.push(`price BETWEEN ? AND ?`)
                params.push(`${price1}`, `${price2}`)
            }

            //Finalizamos construcción de query
            query = `${query} WHERE ${conditions.join(
                ` AND `
            )} ORDER BY ${orderBy} ${orderDirection}`

            console.log(query, params)

            const [result] = await connection.query(query, params);

            res.send({
                data: result

            })
        }
    } catch (error) {
        next(error)
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = search;


