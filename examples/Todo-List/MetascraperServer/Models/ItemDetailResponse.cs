using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Models
{
    public class ItemDetailResponse //: ResponseBase
    {
        public ItemDetailResponse() { }

        public ItemDetailResponse(Item item, List<Group> groups)
        {
            this.Item = new ItemResponse(item);

            Groups = new List<GroupResponse>();
            foreach (Group group in groups)
            {
                Groups.Add(new GroupResponse(group));
            }
        }

        public ItemResponse Item { get; set; }
        public List<GroupResponse> Groups { get; set; }
    }
}