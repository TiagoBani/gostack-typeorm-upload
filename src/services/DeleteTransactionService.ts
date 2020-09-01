import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transaction = await Transaction.findOne(id);
    if (!transaction) throw new AppError(`This transaction ${id} not found`);

    await transaction.remove();
  }
}

export default new DeleteTransactionService();
