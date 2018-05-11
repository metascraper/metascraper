using MetascraperServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Repositories
{
    public class ItemRepository : RepositoryBase
    {
        public List<ItemResponse> GetItemDisplayList()
        {
            // get the logged in user id
            var currentUser = this.GetUser();  // here is where we use security

            // get the items available for display
            using (var db = new DataClasses1DataContext())
            {
                var items = from item in db.Items
                            from grp in db.Groups 
                                .Where(o => item.GroupId == o.GroupId)
                                .DefaultIfEmpty()
                            where item.UserId == currentUser.UserId
                            select new ItemResponse()
                            {
                                ItemId = item.ItemId,
                                Description = item.Description,
                                IsComplete = item.IsComplete,
                                GroupId = item.GroupId,
                                Group = grp.Description,
                                CreateDate = item.CreateDate
                            };
                return items.ToList();
            }
        }

        public ItemDetailResponse GetItem(int itemId)
        {
            // get the item from the db
            using (var db = new DataClasses1DataContext())
            {
                var item = db.Items.FirstOrDefault(x => x.ItemId == itemId);
                if (item != null)
                {
                    // security check
                    var user = this.GetUser();
                    if (item.UserId != user.UserId)
                        throw new UnauthorizedAccessException();
                }
                ItemDetailResponse itemDetail = new ItemDetailResponse(item, db.Groups.ToList());

                // convert and return the item
                return itemDetail;
            }
        }

        public bool CreateItem(ItemRequest itemRequest)
        {
            // get the item from the db
            using (var db = new DataClasses1DataContext())
            {
                Item item = new Item();
                
                item.Description = itemRequest.Description;
                item.GroupId = itemRequest.GroupId;
                item.IsComplete = itemRequest.IsComplete;
                var user = this.GetUser();
                item.UserId = user.UserId;
                item.CreateDate = DateTime.Now;

                db.Items.InsertOnSubmit(item);
                db.SubmitChanges();
                return true;
            }
        }

        public bool UpdateItem(ItemRequest itemRequest)
        {
            // get the item from the db
            using (var db = new DataClasses1DataContext())
            {
                Item item = db.Items.FirstOrDefault(x => x.ItemId == itemRequest.ItemId);
                if (item == null)
                    return false;
                // security check
                var user = this.GetUser();
                if (item.UserId != user.UserId)
                    throw new UnauthorizedAccessException();

                item.Description = itemRequest.Description;
                item.GroupId = itemRequest.GroupId;
                item.IsComplete = itemRequest.IsComplete;

                db.SubmitChanges();
                return true;
            }
        }

        public bool DeleteItem(int itemId)
        {
            // get the item from the db
            using (var db = new DataClasses1DataContext())
            {
                var item = db.Items.FirstOrDefault(x => x.ItemId == itemId);
                if (item == null)
                    return false;

                // security check
                var user = this.GetUser();
                if (item.UserId != user.UserId)
                    throw new UnauthorizedAccessException();

                db.Items.DeleteOnSubmit(item);
                db.SubmitChanges();

                return true;
            }
        }
    }
}