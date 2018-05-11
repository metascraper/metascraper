using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Web;

namespace MetascraperServer.Models
{
    public class UserToken
    {
        public UserToken() { }

        public UserToken(User user)
        {
            this.UserId = user.UserId;
        }

        // TODO: update your custom security attributes here
        public int UserId { get; set; }

        public string Encode()
        {
            // TODO - implement any token security here and in Parse(string)
            var json = JsonConvert.SerializeObject(this);
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(json);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static UserToken Decode(string token)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(token);
            string json = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
            return JsonConvert.DeserializeObject<UserToken>(json);
        }

        public static bool TryDecode(string token, out UserToken userToken)
        {
            try
            {
                userToken = Decode(token);
                return true;
            }
            catch (Exception)
            {
                userToken = null;
                return false;
            }
        }

        public static UserToken Parse(IPrincipal principal)
        {
            return Parse(principal.Identity);
        }

        public static UserToken Parse(IIdentity identity)
        {
            return Parse(identity.Name);
        }

        public static UserToken Parse(string token)
        {
            return JsonConvert.DeserializeObject<UserToken>(token);
        }

        public static bool TryParse(string tokenJson, out UserToken userToken)
        {
            try
            {
                userToken = UserToken.Parse(tokenJson);
                return true;
            }
            catch (Exception)
            {
                userToken = null;
                return false;
            }
        }

    }
}