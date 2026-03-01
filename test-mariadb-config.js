const mariadb = require('mariadb');
const pool1 = mariadb.createPool('mariadb://evoting:evoting_pass@db:3306/evoting_db');
console.log("host parsed as:", pool1._pool?.config?.host || pool1.info || Object.keys(pool1));
