Name:          <%= serviceType %>
Version:       <%= serviceVersion %>
Release:       %(date +%Y%m%d.%H%M)
Summary:       <%= description %>
Packager:      Tesla team <Tesla@exchange.avidww.com>
Group:         Development/Libraries
License:       Avid EULA
Vendor:        Avid Technology Inc.
URL:           http://avid.com
Source:        %{name}-src.tgz
BuildRoot:     %{_tmppath}/%{name}-%{version}-%{release}-root
Prefix:        /opt/avid

AutoReqProv: no

Requires: nodejs avid-acs-nodebal avid-acs-proxybal-node

%define debug_package %{nil}

%description
<%= description %>

%prep
%setup -c -n %{name}

%build
cd module
npm install --production
cd ..


%install
mkdir -p "${RPM_BUILD_ROOT}/etc/rc.d/init.d"
mkdir -p "${RPM_BUILD_ROOT}/opt/avid/sbin"
mkdir -p "${RPM_BUILD_ROOT}/opt/avid/lib/node_modules"
mkdir -p "${RPM_BUILD_ROOT}/etc/sysconfig"
mkdir -p "${RPM_BUILD_ROOT}/opt/avid/bin"
mkdir -p "${RPM_BUILD_ROOT}/etc/logrotate.d"
mkdir -p "${RPM_BUILD_ROOT}/var/log/avid"

mv module "${RPM_BUILD_ROOT}/opt/avid/lib/node_modules/%{name}"
mv initrc "${RPM_BUILD_ROOT}/etc/rc.d/init.d/%{name}"
mv run.js "${RPM_BUILD_ROOT}/opt/avid/sbin/%{name}"
mv sysconfig "${RPM_BUILD_ROOT}/etc/sysconfig/%{name}"
mv logrotate "${RPM_BUILD_ROOT}/etc/logrotate.d/%{name}"

%post
#add chkconfig entry
chkconfig --add %{name}


%preun
# If uninstalling, stop the service and remove chkconfig entry
if [ $1 -eq 0 ]; then
    service %{name} stop ||:
    chkconfig --del %{name}
fi

%postun
# If upgrading, restart the service if it was already running
if [ "$1" -ge "1" ]; then
    service %{name} condrestart ||:
fi

%files
%attr(755, root, root) /etc/rc.d/init.d/%{name}
%attr(755, root, root) /opt/avid/sbin/%{name}
%config /etc/sysconfig/%{name}
/opt/avid/lib/node_modules/%{name}
/etc/logrotate.d/%{name}
/var/log/avid