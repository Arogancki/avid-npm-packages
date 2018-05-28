<% for(var method in ops) {%>
exports.<%= method -%> = <%- ops[method].validation %>;
<% } %>