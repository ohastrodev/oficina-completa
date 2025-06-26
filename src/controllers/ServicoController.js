//DESENVOLVIDO POR MATHEUS
import { ServicoService } from "../services/ServicoService.js";

class ServicoController {

  static async findAll(req, res, next) {
    ServicoService.findAll()
      .then(objs => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    ServicoService.findByPk(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    ServicoService.create(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    ServicoService.update(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    ServicoService.delete(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

}

export { ServicoController };
