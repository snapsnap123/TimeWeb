# Generated by Django 3.2.4 on 2021-07-13 00:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timewebapp', '0062_timewebmodel_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timewebmodel',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Assignment Description'),
        ),
    ]
