const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET_KEY = 'minha-chave-secreta';

// Rota de login (gera o token)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simulação de autenticação
    if (username === 'admin' && password === '1234') {
        const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ message: 'Credenciais inválidas' });
});

// Middleware para verificar o token
function autenticarToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(403).json({ message: 'Token obrigatório' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });

        req.user = decoded;
        next();
    });
}

// Rota protegida
app.get('/dados-seguros', autenticarToken, (req, res) => {
    res.json({ message: 'Acesso autorizado!', usuario: req.user });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

