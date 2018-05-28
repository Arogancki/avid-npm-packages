<%= projectName %>
======================
<%= description %>


# API

<% for(var method in ops) {%>
## <%= method %>

Description: <%= ops[method].description %>

<% var path = ((ops[method].path || '').match(/\{[^}]+\}/gi) || []).map(s => {return s.replace(/[{}]/gi,'')}).filter(Boolean); -%>
<% if (path && path.length > 0) { -%>
Path:
    <% for(var i=0; i<path.length; i++) { -%>
        * <%= path[i] %>  - string
    <% } -%>
<% } -%>

Request:
```json
{
  "serviceType": "<%= serviceType %>",
  "serviceRealm": "<%= serviceRealm %>",
  "serviceVersion": <%= serviceVersion %>,
  "op": "<%= method %>",
  "paramSet": {
        "path": {
        <% for(var i=0; i<path.length - 1; i++) { -%>
            "<%= path[i] %>": "string",
        <% } -%>
            "<%= path[i] %>": "string"
        },
        "query": {
        },
        "body": {
        }
  }
}
```
<% } %>

# RPM

## Build RPM
```sh
cd ./out
chmod +x ./create-rpm.sh
./create-rpm.sh
```

## Install RPM
```sh
sudo yum install ./rpmbuild/rpms/x86_64/<%= serviceType %>{..}.rpm
```sh

## Remove RPM
```sh
sudo yum remove <%= serviceType %>
```