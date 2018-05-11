using MetascraperServer.Models;
using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MetascraperServer.Code
{
    public class Startup
    {
        private const string EnableCorsSetting = "EnableCORS";
        private const string ResetDataSetting = "ResetData";

        private const string Username = "user";
        private const string Group1 = "Group 1";
        private const string Group2 = "Group 2";
        private const string Group3 = "Group 3";

        public void OnApplicationStart(HttpConfiguration config)
        {
            CheckEnableCORS(config);
            CheckResetData();
        }

        /* Handle enabling CORS if needed */
        private void CheckEnableCORS(HttpConfiguration config)
        {
            if (IsEnableCORS())
            {
                EnableCORS(config);
            }
        }

        private bool IsEnableCORS() { 
            using (var dc = new DataClasses1DataContext())
            {
                var setting = dc.Settings.Where(x => x.Name == EnableCorsSetting).FirstOrDefault();
                if (setting == null)
                {
                    /* Create the false record */
                    setting = new Setting() { Name = EnableCorsSetting, Value = "0" };
                    dc.Settings.InsertOnSubmit(setting);
                    dc.SubmitChanges();
                }
                return setting.Value != "0";
            }
        }

        private void EnableCORS(HttpConfiguration config)
        {
            // uncomment and customize these lines to enable CORS
            //var corsAttr = new EnableCorsAttribute("http://localhost:50550", "*", "*");
            //config.EnableCors(corsAttr);
        }

        // were going to add test data to the db if it doesnt exist
        private void CheckResetData()
        {
            if (IsResetData())
            {
                ResetData();
                CreateUserData();
                CreateGroupData();
                CreateItemData();
                UpdateResetData();
            }
        }

        private bool IsResetData()
        {
            using (var dc = new DataClasses1DataContext())
            {
                var setting = dc.Settings.Where(x => x.Name == ResetDataSetting).FirstOrDefault();
                return setting == null || setting.Value != "0";
            }
        }

        private void ResetData()
        {
            using (var dc = new DataClasses1DataContext())
            {
                dc.Groups.DeleteAllOnSubmit(dc.Groups);
                dc.Users.DeleteAllOnSubmit(dc.Users);
                dc.Items.DeleteAllOnSubmit(dc.Items);
                
                dc.SubmitChanges();
            }
        }
      
        private void CreateUserData()
        {
            using (var dc = new DataClasses1DataContext())
            {
                dc.Users.InsertOnSubmit(
                    new User() { Username = Username, Password = "pass" }
                );
                dc.SubmitChanges();
            }
        }

        private void CreateGroupData()
        {
            using (var dc = new DataClasses1DataContext())
            {
                var userId = dc.Users.First(x => x.Username == Username).UserId;
                dc.Groups.InsertAllOnSubmit(new List<Group>()
                    {
                        new Group() { Description = Group1, UserId = userId, CreateDate = DateTime.Now.AddDays(-3) },
                        new Group() { Description = Group2, UserId = userId, CreateDate = DateTime.Now.AddDays(-2) },
                        new Group() { Description = Group3, UserId = userId, CreateDate = DateTime.Now.AddDays(-1) }
                    }
                );
                dc.SubmitChanges();
            }
        }

        private void CreateItemData()
        {
            using (var dc = new DataClasses1DataContext())
            {
                // get the ids of the user and group 
                var userId = dc.Users.First(x => x.Username == Username).UserId;
                var group1Id = dc.Groups.First(x => x.Description == Group1).GroupId;
                var group2Id = dc.Groups.First(x => x.Description == Group2).GroupId;
                var group3Id = dc.Groups.First(x => x.Description == Group3).GroupId;

                dc.Items.InsertAllOnSubmit(new List<Item>()
                    {
                        new Item() { ItemId = 1, Description = "Item 1", IsComplete = true, GroupId = group2Id, UserId = userId, CreateDate = DateTime.Now.AddDays(-2) },
                        new Item() { ItemId = 2, Description = "Item 2", IsComplete = false, GroupId = group3Id, UserId = userId, CreateDate = DateTime.Now.AddDays(-1) },
                        new Item() { ItemId = 3, Description = "Item 3", IsComplete = false, GroupId = group2Id, UserId = userId, CreateDate = DateTime.Now.AddDays(0) },
                        new Item() { ItemId = 4, Description = "Item 4", IsComplete = true, GroupId = group1Id, UserId = userId, CreateDate = DateTime.Now.AddDays(-3) }
                    });
                dc.SubmitChanges();
            }
        }

        private void UpdateResetData()
        {
            using (var dc = new DataClasses1DataContext())
            {
                var resetData = dc.Settings.Where(x => x.Name == ResetDataSetting).FirstOrDefault();
                if (resetData == null)
                {
                    resetData = new Setting() { Name = ResetDataSetting };
                    dc.Settings.InsertOnSubmit(resetData);
                }
                resetData.Value = "0";
                dc.SubmitChanges();
            }
        }
       
    }
}

