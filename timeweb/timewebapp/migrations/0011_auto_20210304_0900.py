# Generated by Django 3.1.3 on 2021-03-04 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timewebapp', '0010_auto_20210304_0835'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timewebmodel',
            name='ad',
            field=models.DateField(null=True, verbose_name='Enter the Assignment Date'),
        ),
        migrations.AlterField(
            model_name='timewebmodel',
            name='x',
            field=models.DateField(blank=True, null=True, verbose_name='Enter the Due Date'),
        ),
    ]
