import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

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
  response.status(201).json({ ...transaction });
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await DeleteTransactionService.execute(id);
  response.status(204).send();
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
