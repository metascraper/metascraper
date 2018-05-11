using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Models
{
    public class GroupListDetailResponse //: ResponseBase
    {
        public GroupListDetailResponse() { }

        public GroupListDetailResponse(List<Group> groups)
        {
            Groups = new List<GroupResponse>();
            foreach (Group group in groups)
            {
                Groups.Add(new GroupResponse(group));
            }
        }

        public List<GroupResponse> Groups { get; set; }

    }
}