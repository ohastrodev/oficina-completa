//DESENVOLVIDO POR DIEGO
import { FormaPagamentoService } from "../services/FormaPagamentoService.js";

class FormaPagamentoController {

  static async findAll(req, res, next) {
    FormaPagamentoService.findAll()
      .then(objs => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    FormaPagamentoService.findByPk(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    FormaPagamentoService.create(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    FormaPagamentoService.update(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    FormaPagamentoService.delete(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

}

export { FormaPagamentoController };
