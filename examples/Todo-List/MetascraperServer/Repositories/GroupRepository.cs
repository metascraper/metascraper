using MetascraperServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Repositories
{
    public class GroupRepository : RepositoryBase
    {
        public GroupListDetailResponse GetGroupListDetailList()
        {
            // get the items available for display
            using (var db = new DataClasses1DataContext())
            {
                return new GroupListDetailResponse(db.Groups.ToList());
            }
        }

        //public GroupResponse GetGroup(int groupId)
        //{
        //    // get the item from the db
        //    using (var db = new DataClasses1DataContext())
        //    {
        //        var item = db.Groups.FirstOrDefault(x => x.GroupId == groupId);
        //        if (item == null)
        //            return null;

        //        // convert and return the item
        //        return new GroupResponse(item);
        //    }
        //}

        public GroupResponse Create(GroupRequest groupRequest)
        {
            using (var db = new DataClasses1DataContext())
            {
                Group group = new Group()
                {
                    Description = groupRequest.Description,
                    CreateDate = DateTime.Now
                };
                db.Groups.InsertOnSubmit(group);
                db.SubmitChanges();  
                return new GroupResponse(group);
            }
        }

        public GroupResponse Update(GroupRequest groupRequest)
        {
            using (var db = new DataClasses1DataContext())
            {
                var group = db.Groups.FirstOrDefault(x => x.GroupId == groupRequest.GroupId);
                if (group == null)
                    return null;
                group.Description = groupRequest.Description;
                db.SubmitChanges();
                return new GroupResponse(group);
            }
        }

        public bool Delete(int groupId)
        {
            using (DataClasses1DataContext db = new DataClasses1DataContext())
            {
                var group = db.Groups.FirstOrDefault(x => x.GroupId == groupId);
                if (group == null)
                    return false;
                // change all the items in that group to null
                db.Items.Where(x => x.GroupId == groupId)
                    .ToList().ForEach(x => x.GroupId = null);


                // and delete the group
                db.Groups.DeleteOnSubmit(group);
                db.SubmitChanges();
                return true;
            }
        }

    }
}