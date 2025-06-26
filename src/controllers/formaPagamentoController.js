//DESENVOLVIDO POR DIEGO
import { formaPagamentoService } from "../services/formaPagamentoService.js";

class FormaPagamentoController {

  static async findAll(req, res, next) {
    formaPagamentoService.findAll()
      .then(objs => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    formaPagamentoService.findByPk(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    formaPagamentoService.create(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    formaPagamentoService.update(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    formaPagamentoService.delete(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

}

export { FormaPagamentoController };
