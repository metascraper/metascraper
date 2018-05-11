using System;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Security.Principal;
using System.Threading;
using MetascraperServer.Models;
using Newtonsoft.Json;

namespace MetascraperExample.Filters
{
    /// Custom Security for handling tokens
    public class AuthorizationFilter : AuthorizeAttribute
    {
        /// <summary>
        /// override OnAuthorization
        /// </summary>
        /// <param name="actionContext"></param>
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            if (actionContext == null)
                throw new ArgumentNullException("actionContext");

            if (AllowAnonymous(actionContext))
                return; 

            string token;
            UserToken userToken;
            if (TryGetToken(actionContext.Request, out token)
                && ValidateToken(token, out userToken))
            {
                string json = JsonConvert.SerializeObject(userToken);
                AuthorizeUser(json);
            }
        }

        /// <summary>
        /// allows execute methods without [Authorize] or with [AllowAnonymous] annotation.
        /// </summary>
        /// <param name="actionContext"></param>
        /// <returns></returns>
        private static bool AllowAnonymous(HttpActionContext actionContext)
        {
            return actionContext.ActionDescriptor.GetCustomAttributes<AllowAnonymousAttribute>().Any()
                   || actionContext.ControllerContext.ControllerDescriptor.GetCustomAttributes<AllowAnonymousAttribute>().Any();
        }

        /// <summary>
        /// Find and return Authorization: Bearer [token]
        /// </summary>
        /// <param name="request"></param>
        /// <param name="userId"></param>
        /// <returns>token if it finds it</returns>
        private static bool TryGetToken(HttpRequestMessage request, out string token)
        {
            const string AuthTag = "Authorization";
            const string BearerTag = "Bearer ";


            token = null; // default value
            if (!request.Headers.Contains(AuthTag))
                return false;

            string auth = request.Headers.GetValues(AuthTag).First();

            if (!auth.StartsWith(BearerTag))    
                return false;

            token = auth.Remove(0, BearerTag.Length);
            return !String.IsNullOrWhiteSpace(token);
        }

        /// <summary>
        /// Validates token 
        /// Update this with your custom implementation, JWT is recommended
        /// </summary>
        /// <param name="token"></param>
        private static bool ValidateToken(string token, out UserToken userToken)
        {
            // TODO: Update your custom token validation here
            if (!UserToken.TryDecode(token, out userToken))
                return false;
            if (userToken.UserId <= 0)    
                return false;
            return true;
        }

        /// <summary>
        /// The user is Authorized, set the principal
        /// </summary>
        /// <param name="token"></param>
        private static void AuthorizeUser(string token)
        {
            GenericIdentity identity = new GenericIdentity(token);
            string[] roles = new string[] { "*" };  // update to implement role based security
            GenericPrincipal principal = new GenericPrincipal(identity, roles);
            // set the principal
            Thread.CurrentPrincipal = principal;
            if (HttpContext.Current != null)
                HttpContext.Current.User = principal;
        }
        
    }
}