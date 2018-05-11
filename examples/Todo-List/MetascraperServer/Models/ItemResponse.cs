using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Models
{
    public class ItemResponse 
    {
        public ItemResponse() {  }

        public ItemResponse(Item item)
        {
            if (item == null)
                return;
            this.ItemId = item.ItemId;
            this.Description = item.Description;
            this.IsComplete = item.IsComplete;
            this.GroupId = item.GroupId;
            this.UserId = item.UserId;
            this.CreateDate = item.CreateDate;
        }

        public int ItemId { get; set; }
        public string Description { get; set; }
        public bool IsComplete { get; set; }
        public int? GroupId { get; set; }
        public string Group { get; set; }
        public DateTime CreateDate { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
    }

    

}