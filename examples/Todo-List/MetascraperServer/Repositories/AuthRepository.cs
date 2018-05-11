using MetascraperServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Repositories
{
    public class AuthRepository
    {

        public bool TryLogin(LoginRequest credentials, out UserToken token)
        {
            token = null;
            if (String.IsNullOrWhiteSpace(credentials.Username) || String.IsNullOrWhiteSpace(credentials.Password))
                return false;

            using (var db = new DataClasses1DataContext())
            {
                User user = db.Users.FirstOrDefault(x => x.Username == credentials.Username.Trim()
                                                            && x.Password == credentials.Password);
                if (user == null)
                    return false;

                // TODO - update your custom security implementation here
                token = new UserToken(user); ;     
                return true;
            }
            

        }

    }
}