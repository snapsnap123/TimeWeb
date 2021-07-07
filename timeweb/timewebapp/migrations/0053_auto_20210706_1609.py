# Generated by Django 3.2.4 on 2021-07-06 23:09

from django.db import migrations, models
import timewebapp.models


class Migration(migrations.Migration):

    dependencies = [
        ('timewebapp', '0052_remove_settingsmodel_date_now'),
    ]

    operations = [
        migrations.AddField(
            model_name='settingsmodel',
            name='added_gc_assignments',
            field=models.JSONField(default=timewebapp.models.empty_list),
        ),
        migrations.AlterField(
            model_name='timewebmodel',
            name='fixed_mode',
            field=models.BooleanField(default=False),
        ),
    ]
