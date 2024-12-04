const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Configurar o middleware para processar os dados do formulário
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar banco de dados SQLite
const db = new sqlite3.Database('./form_data.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabela no banco de dados
db.run(`
    CREATE TABLE IF NOT EXISTS form_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL
    )
`);

// Rota para salvar os dados do formulário
app.post('/submit-form', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const query = `INSERT INTO form_data (name, email, message) VALUES (?, ?, ?)`;
    db.run(query, [name, email, message], function (err) {
        if (err) {
            console.error('Erro ao inserir os dados:', err.message);
            return res.status(500).send('Erro ao salvar os dados.');
        }
        res.send('Dados enviados com sucesso!');
    });
});

// Rota para visualizar os dados salvos (apenas para teste)
app.get('/data', (req, res) => {
    db.all('SELECT * FROM form_data', [], (err, rows) => {
        if (err) {
            console.error('Erro ao recuperar os dados:', err.message);
            return res.status(500).send('Erro ao recuperar os dados.');
        }
        res.json(rows);
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
