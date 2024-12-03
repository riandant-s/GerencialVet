const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = 8080;

// Configurando o Sequelize
const sequelize = new Sequelize("petshop", "rian2", "12345", {
  host: "localhost",
  dialect: "mysql",
});

// Definindo o modelo para os clientes e animais

const Appointment = sequelize.define(
  "Appointment",
  {
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

const Pet = sequelize.define(
  "Pet",
  {
    petName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Sincronizando o banco
sequelize
  .sync()
  .then(() => {
    console.log("Banco sincronizado!");
  })
  .catch((err) => {
    console.error("Erro ao sincronizar o banco:", err);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Rotas para os arquivos HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/agendamento", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "agendamento.html"));
});

app.get("/dados", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dados.html"));
});

// Rota para exibir o formulário de cadastro
app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cadastro.html"));
});

app.post("/agendar", async (req, res) => {
  try {
    const { petId, date, time } = req.body;

    // Validação básica
    if (!petId || !date || !time) {
      return res.status(400).json({ message: "Dados incompletos para agendamento." });
    }

    // Verificar se o horário já está ocupado
    const existingAppointment = await Appointment.findOne({
      where: { date, time },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Horário indisponível. Escolha outro." });
    }

    // Criar o agendamento
    const newAppointment = await Appointment.create({ petId, date, time });

    res.status(201).json({
      message: "Agendamento realizado com sucesso!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Erro ao agendar consulta:", error);
    res.status(500).json({ message: "Erro ao agendar consulta." });
  }
});

// Rota para adicionar um pet

app.post("/cadastro", async (req, res) => {
  try {
    const { petName, species, breed, age, ownerName, cpf, contact } = req.body;

    const existingPet = await Pet.findOne({ where: { cpf } });
    if (existingPet) {
      return res.status(400).json({ message: "CPF já cadastrado!" });
    }

    const newPet = await Pet.create({
      petName,
      species,
      breed,
      age,
      ownerName,
      cpf,
      contact,
    });

    res.status(201).json({ message: "Pet cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error);
    res.status(500).json({ message: "Erro ao cadastrar pet." });
  }
});

// Rota para buscar todos os pets
app.get("/pets", async (req, res) => {
  try {
    const pets = await Pet.findAll();
    res.json(pets);
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    res.status(500).send("Erro ao buscar pets.");
  }
});

//Pesquisa do cpf

app.post("/buscarPetsPorDono", async (req, res) => {
  const { cpf } = req.body;

  try {
    const pets = await Pet.findAll({
      where: { cpf },
    });

    if (pets.length > 0) {
      res.json(pets);
    } else {
      res.status(404).send("Nenhum pet encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    res.status(500).send("Erro ao buscar pets.");
  }
});


// Inicializando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});