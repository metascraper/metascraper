using MetascraperServer.Models;
using MetascraperServer.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MetascraperServer.Controllers
{
    [Authorize]
    public class GroupsController : ApiController
    {
        /// <summary>
        /// Gets the user specific items 
        /// </summary>
        /// <returns></returns>
        public HttpResponseMessage Get()
        {
            var repo = new GroupRepository();
            var groups = repo.GetGroupListDetailList(); 
            return Request.CreateResponse(HttpStatusCode.OK, groups);
        }

        public HttpResponseMessage Post([FromBody] GroupRequest groupRequest)
        {
            var repo = new GroupRepository();
            var group = repo.Create(groupRequest);
            var code = (group != null) ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
            return Request.CreateResponse(code, group);
        }

        public HttpResponseMessage Put([FromBody] GroupRequest groupRequest)
        {
            var repo = new GroupRepository();
            var group = repo.Update(groupRequest);
            var code = (group != null) ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
            return Request.CreateResponse(code, group);
        }

        public HttpResponseMessage Delete(int id)
        {
            var repo = new GroupRepository();
            var deleted = repo.Delete(id);
            var code = (deleted) ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
            return Request.CreateResponse(code, deleted);
        }

    }
}
