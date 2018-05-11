using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetascraperServer.Models
{
    public class GroupRequest //: ResponseBase
    {
        public GroupRequest() { }

        public int GroupId { get; set; }
        public string Description { get; set; }
    }
}