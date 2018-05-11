using MetascraperServer.Code;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace MetascraperServer
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                lblError.Visible = false;
                lblInitialized.Visible = true;
                Response.Redirect("app/login/login.htm");
            }
            catch (Exception ex)
            {
                lblError.Text = String.Format("Error Initializing Metascraper Server: {0}", ex.Message);
                lblInitialized.Visible = true;
                lblError.Visible = false;
            }
        }
    }
}