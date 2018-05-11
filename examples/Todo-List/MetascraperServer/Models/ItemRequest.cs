using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Models
{
    public class ItemRequest
    {
        public ItemRequest() {  }

        public int ItemId { get; set; }
        public string Description { get; set; }
        public bool IsComplete { get; set; }
        public int GroupId { get; set; }
    }

    

}