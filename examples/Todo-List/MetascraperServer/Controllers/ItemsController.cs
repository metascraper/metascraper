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
    public class ItemsController : ApiController
    {
        /// <summary>
        /// Gets the user specific items 
        /// </summary>
        /// <returns></returns>
        public HttpResponseMessage Get()
        {
            var repo = new ItemRepository();
            var items = repo.GetItemDisplayList(); // filters to user
            var response = new ItemListResponse() { Items = items };
            return Request.CreateResponse(HttpStatusCode.OK, response);
        }

        /// <summary>
        /// Gets a specific item, throws an error is the user cannot access item
        /// </summary>
        /// <param name="itemId"></param>
        /// <returns></returns>
        public HttpResponseMessage Get(int id)
        {
            try
            {
                var repo = new ItemRepository();
                var item = repo.GetItem(id);
                return Request.CreateResponse(HttpStatusCode.OK, item);
            }
            catch (UnauthorizedAccessException)
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden);
            }

        }

        public HttpResponseMessage Post([FromBody] ItemRequest item)
        {
            try
            {
                var repo = new ItemRepository();
                var saved = repo.CreateItem(item);
                var code = saved ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
                return Request.CreateResponse(code, saved);
            }
            catch (UnauthorizedAccessException)
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden);
            }
        }

        public HttpResponseMessage Put([FromBody] ItemRequest item)
        {
            try
            {
                var repo = new ItemRepository();
                var saved = repo.UpdateItem(item);
                var code = saved ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
                return Request.CreateResponse(code, saved);
            }
            catch (UnauthorizedAccessException)
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden);
            }
        }

        public HttpResponseMessage Delete(int id)
        {
            try
            {
                var repo = new ItemRepository();
                var saved = repo.DeleteItem(id);
                var code = saved ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
                return Request.CreateResponse(code, saved);
            }
            catch (UnauthorizedAccessException)
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden);
            }
        }
    }
}
