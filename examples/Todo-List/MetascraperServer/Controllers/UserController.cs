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
    public class UserController : ApiController
    {
        [AllowAnonymous]
        [Route("api/User/Login")]
        public HttpResponseMessage Login([FromBody] LoginRequest credentials)
        {
            var userRepo = new UserRepository();
            UserToken token;
            if (!userRepo.TryLogin(credentials, out token))
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);

            var loginResp = new LoginResponse() { Token = token.Encode() };
            return Request.CreateResponse(HttpStatusCode.OK, loginResp);
        }

        [AllowAnonymous]
        [Route("api/User/Signup")]
        public HttpResponseMessage Signup([FromBody] LoginRequest credentials)
        {
            var userRepo = new UserRepository();
            if (!userRepo.Signup(credentials))
                return new HttpResponseMessage(HttpStatusCode.Forbidden);

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
