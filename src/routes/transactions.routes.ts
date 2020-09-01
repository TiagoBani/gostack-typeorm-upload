import fs from 'fs';

import { Router } from 'express';
import multer from 'multer';
import parse from 'csv-parse';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactions = await Transaction.find();
  const balance = await TransactionsRepository.getBalance();
  return response.json({ balance, transactions });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transaction = await CreateTransactionService.execute({
    title,
    value,
    type,
    category,
  });
  return response.status(201).json({ ...transaction });
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await DeleteTransactionService.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('import'),
  async (request, response) => {
    const { path } = request.file;

    const transactionsPromises = await ImportTransactionsService.execute(path);
    const transactions = await Promise.all(transactionsPromises);
    return response.status(201).json(transactions);
  },
);

export default transactionsRouter;
