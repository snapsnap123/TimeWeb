# Generated by Django 3.2.7 on 2021-12-07 02:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timewebapp', '0098_settingsmodel_use_in_progress'),
    ]

    operations = [
        migrations.AddField(
            model_name='settingsmodel',
            name='animation_speed',
            field=models.CharField(choices=[(1, 'Normal'), (0.5, 'Fast'), (0, 'None')], default='Normal', max_length=6, verbose_name='Animation Speed'),
        ),
    ]
