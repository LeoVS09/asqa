
from dynaconf import Dynaconf

settings = Dynaconf(
    envvar_prefix=False,
    settings_files=['pack.settings.yaml', 'pack.secrets.yaml'],
)

# `envvar_prefix` = export envvars with `export DYNACONF_FOO=bar`.
# `settings_files` = Load this files in the order.
