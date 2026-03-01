const mariadb = require('mariadb');
const url = 'mariadb://evoting:evoting_pass@db:3306/evoting_db';
const pool = mariadb.createPool(url);
console.log(pool);
