using MetascraperServer.Models;
using MetascraperServer.Repositories;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MetascraperServer.Controllers
{
    public class AuthController : ApiController
    {
        [AllowAnonymous]
        public HttpResponseMessage Post([FromBody] LoginRequest credentials)
        {
            var authRepo = new AuthRepository();
            UserToken token;
            if (!authRepo.TryLogin(credentials, out token))
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);

            var loginResp = new LoginResponse() { token = token.Encode() };
            return Request.CreateResponse(HttpStatusCode.OK, loginResp);
        }
    }
}
