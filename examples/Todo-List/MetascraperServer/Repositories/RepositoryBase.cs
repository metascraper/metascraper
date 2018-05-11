using MetascraperServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Web;

namespace MetascraperServer.Repositories
{
    public class RepositoryBase
    {
        protected UserToken GetUser()
        {
            return UserToken.Parse(Thread.CurrentPrincipal);
        }

        //protected bool HasAccessToItem(int userId, int itemId, out Item item)
        //{
        //    using (var db = new DataClasses1DataContext())
        //    {
        //        item = db.Items.FirstOrDefault(x => x.ItemId == itemId && x.UserId == userId);
        //        return item != null;
        //    }
        //}
    }
}