class AppResponse {
  /**
   * @param {string} message - Message destiné à l'utilisateur
   * @param {object|null} data - Les données à renvoyer
   * @param {number} statusCode - Code HTTP (200, 201, etc.)
   * @param {string} code - Code interne de succès
   * @param {boolean} success - Indique si c'est un succès
   * @param {object|null} details - Informations supplémentaires
   */
  constructor({
    message,
    data = null,
    statusCode = 200,
    code = "SUCCESS",
    success = true,
    details = null,
  }) {
    (this.message = message),
      (this.data = data),
      (this.statusCode = statusCode),
      (this.code = code),
      (this.success = success),
      (this.details = details);
  }

  send(res) {
    const response = {
      success: this.success,
      code: this.code,
      message: this.message,
      data: this.data,
    };

    if (this.details != null) response.details = this.details;

    return res.status(this.statusCode).json(response);
  }
}

module.exports = AppResponse;
