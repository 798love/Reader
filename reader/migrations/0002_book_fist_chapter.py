# Generated by Django 4.0.5 on 2022-06-22 13:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reader', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='fist_chapter',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]