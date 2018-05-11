<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MetascraperServer.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href="styles/global.css" rel="stylesheet" />
    <link href="styles/Default.css" rel="stylesheet" />
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <div class="well">
                <h1>Metascraper Example</h1>
                <p>Hello</p>
                <p>Thank you for choosing Metascraper</p>
                <p><b>Next Step:</b> Redirecting... Click <a href="app/login/login.htm">here</a> if you have waited more than 3 seconds.</p>
            </div>
            <div id="divMessage">
                <asp:Label ID="lblInitialized" runat="server" Visible="false">Server Initialized Successfully...</asp:Label>
                <asp:Label ID="lblError" runat="server" ForeColor="Red"></asp:Label>
            </div>
        </div>

    </form>
</body>
</html>
