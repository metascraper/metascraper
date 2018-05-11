using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Models
{
    public class GroupResponse //: ResponseBase
    {
        public GroupResponse() { }

        public GroupResponse(Group group)
        {
            this.GroupId = group.GroupId;
            this.Description = group.Description;
            this.UserId = group.UserId;
            this.CreateDate = group.CreateDate;
        }

        public int GroupId { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
        public DateTime CreateDate { get; set; }

    }
}