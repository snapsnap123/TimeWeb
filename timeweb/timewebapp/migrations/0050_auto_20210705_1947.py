# Generated by Django 3.2.4 on 2021-07-06 02:47

from django.db import migrations, models
import timewebapp.models


class Migration(migrations.Migration):

    dependencies = [
        ('timewebapp', '0049_rename_first_login_settingsmodel_enable_tutorial'),
    ]

    operations = [
        migrations.AddField(
            model_name='settingsmodel',
            name='oauth_token',
            field=models.JSONField(default=timewebapp.models.empty_list),
        ),
        migrations.AlterField(
            model_name='timewebmodel',
            name='assignment_name',
            field=models.CharField(max_length=200, verbose_name='Name of this Assignment'),
        ),
        migrations.AlterField(
            model_name='timewebmodel',
            name='works',
            field=models.JSONField(default=timewebapp.models.empty_list),
        ),
    ]
