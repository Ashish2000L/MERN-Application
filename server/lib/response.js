class ResponseBuilder {
    constructor(data = null) {
      this.status = 200;
      this.data = data
      this.success = true
      this.message = '';
      this.statusCode='success';
      return this
    }
  
    err(message= '',status = 500,statusCode = null) {
        this.setStatus(status)
      this.success = false
      this.statusCode = statusCode
      this.setMessage(message)
      return this
    }

    setStatusCode(statusCode){
      this.statusCode = statusCode;
      return this
    }
  
    setMessage(message) {
      this.message = message
      return this
    }
  
    setMeta(meta) {
      this.meta = meta
      return this
    }

    setStatus(status){
        this.status = status;
        return this
    }
  
    toJSON() {
      const res= {}
  
      for (const [key, value] of Object.entries(this)) {
        if (value !== undefined && value !== null) {
          res[key] = value
        }
      }
  
      return res
    }
  }


module.exports.ResponseBuilder = ResponseBuilder;