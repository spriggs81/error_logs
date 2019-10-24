<% if(line.result){ %>
  <tr class='<%= classes + " no" + n + " sql" + n %>'>
    <% if(typeof(line.result) === 'boolean'){ %>
      <td colspan="8">Result: <%= line.result %></td>
    <% } %>
    <% if(typeof(line.result) === 'object'){ %>
      <% if(line.result.isArray() === true){ %>
        <td colspan="8">Result: [
        <% line.result.forEach(function(rStuff){ %>
          <% if(rStuff === null){ %>
            null,
          <% } %>
          ]
          <% if(typeof(rStuff) === 'object'){ %>
            <% for (const key of Object.keys(line.result)) { %>
              <% let val = line.result[key] %>
              <% if(typeof(val) === 'object'){ %>
                <%= key+": { " %>
                <% if(val === null){ %>
                  <%= null %>
                <% } else { %>
                  <% for (const key1 of Object.keys(line.result[key])) { %>
                    <% let val1 = line.result[key][key1] %>
                    <%# if json object %>
                    <% if(typeof(val1) === 'object'){ %>
                      <%= key1+": { " %>
                      <% if(val1 === null){ %>
                        <%= null %>
                      <% } else { %>
                        <% for (const key2 of Object.keys(line.result[key][key1])) { %>
                          <% let val2 = line.result[key][key1][key2] %>
                          <%= key2 + ": " + val2 %>
                        <% } %>
                        <%= "}" %>
                      <% } %>
                    <% } else { %>
                      <%# if string %>
                      <%= key1 + ": " + val1 + "," %>
                    <% } %>
                  <% } %>
                <% } %>
              <% } else { %>
                <%= key +": " + val + "," %>
              <% } %>
              <% if(key == 'data'){%>
                <% line.result[key].forEach(function(dataStuff){ %>
                  <%- dataStuff + "," %>
                <% }) %>
              <% } %>
            <% } %>
          <% } %>
        <% } %>
        }
        </td>
      <% } %>
    <% } %>
  </tr>
<% } %>
<% n++ %>
